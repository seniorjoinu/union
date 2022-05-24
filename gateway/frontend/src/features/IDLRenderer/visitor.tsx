import React, { useCallback, useContext, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import {
  Field,
  Text,
  Column,
  Button,
  AdvancedSelect,
  AdvancedOption,
  Checkbox,
  ShiftedColumn,
  getFontStyles,
} from '@union/components';
import styled from 'styled-components';
import { useWatch, useFieldArray } from 'react-hook-form';
import { Editor } from './editors';
import { Empty, RenderProps, context, transformName, AdornmentWrapper, getSettings } from './utils';

export interface OptFormProps extends RenderProps {
  type: IDL.Type;
  path: string;
}
export const OptForm = ({ type, path, absolutePath, ...p }: OptFormProps) => {
  const ctx = useContext(context);
  const settings = getSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);
  const enabled = !!ctx.getValues(path)?.length;

  const component = useMemo(
    () =>
      type.accept(
        new Render({
          path: `${path}${path ? '.' : ''}0`,
          absolutePath: `${absolutePath}${absolutePath ? '.' : ''}0`,
        }),
        null,
      ),
    [type, path, absolutePath],
  );
  const name = settings.label || p.name;

  if (settings.hide) {
    return null;
  }

  return (
    <Column>
      <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
        <Checkbox
          onChange={() =>
            ctx.setValue(path, !enabled ? [type.accept(new Empty(), null)] : [], {
              shouldValidate: true,
            })
          }
          checked={enabled}
          helperText={state.error?.message}
        >
          {name}
        </Checkbox>
        {enabled && <ShiftedColumn>{component}</ShiftedColumn>}
      </AdornmentWrapper>
    </Column>
  );
};

export interface RecordFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const RecordForm = ({ fields, path, absolutePath, ...p }: RecordFormProps) => {
  const ctx = useContext(context);
  const settings = getSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);

  const orderedFields = useMemo(
    () =>
      fields.sort((a, b) => {
        const as = ctx.settings[`${path}${path ? '.' : ''}${a[0]}`] || {};
        const bs = ctx.settings[`${path}${path ? '.' : ''}${b[0]}`] || {};

        if (!('order' in as) && !('order' in bs)) {
          return 0;
        }
        return (as.order || 100) - (bs.order || 100);
      }),
    [fields, ctx.settings],
  );

  if (settings.hide) {
    return null;
  }

  const Wrapper = path ? ShiftedColumn : Column;
  const name = settings.label || p.name;

  // TODO upgrade order to indexed
  return (
    <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
      <Field title={<Text weight='medium'>{name}</Text>} helperText={state.error?.message}>
        <Wrapper margin={16}>
          {orderedFields.map(([key, field]) => {
            const currentPath = `${path}${path ? '.' : ''}${key}`;

            return field.accept(
              new Render({
                path: currentPath,
                absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${key}`,
                key: currentPath,
                name: ctx.transformLabel(key, transformName),
              }),
              null,
            );
          })}
        </Wrapper>
      </Field>
    </AdornmentWrapper>
  );
};

export interface VariantFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const VariantForm = ({ fields, path, absolutePath, ...p }: VariantFormProps) => {
  const ctx = useContext(context);
  const settings = getSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);
  const value = ctx.getValues(path) || {};

  const selected = useMemo(() => {
    const keys = Object.keys(value);

    return fields.find(([key]) => key == keys[0]) || null;
  }, [value, fields]);

  const selectedItem = useMemo(() => {
    if (!selected) {
      return null;
    }

    return selected[1].accept(
      new Render({
        path: `${path}${path ? '.' : ''}${selected[0]}`,
        absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${selected[0]}`,
        name: ctx.transformLabel(selected[0], transformName),
      }),
      null,
    );
  }, [selected, fields, ctx.transformLabel, path, absolutePath]);

  const handleChange = useCallback(
    (_: string, field: [string, IDL.Type]) => {
      ctx.setValue(
        path,
        { [field[0]]: field[1].accept(new Empty(), null) },
        { shouldValidate: true },
      );
    },
    [ctx.setValue],
  );

  const Wrapper = path ? ShiftedColumn : Column;
  const name = settings.label || p.name;

  if (settings.hide) {
    return null;
  }

  return (
    <Column>
      <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
        <AdvancedSelect
          label={name}
          onChange={handleChange}
          value={selected ? [selected[0]] : []}
          multiselect={false}
          placeholder='Select variant'
          helperText={state.error?.message}
        >
          {fields.map((field) => (
            <AdvancedOption key={field[0]} value={field[0]} obj={field} />
          ))}
        </AdvancedSelect>
        <Wrapper>{selectedItem}</Wrapper>
      </AdornmentWrapper>
    </Column>
  );
};

export const VecTitle = styled(Text)<{ $error?: string }>`
  position: relative;
  &&& {
    margin-bottom: 8px;
  }

  &::before {
    content: ${({ $error }) => ($error ? `"${$error}"` : 'none')};
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    color: ${({ theme }) => theme.colors.red};
    ${getFontStyles('caption', 'regular')}
  }

  &:empty {
    display: none;
  }
`;
export const VecButton = styled(Button)``;
export const VecContainer = styled(Column)`
  ${VecButton} {
    align-self: flex-start;
  }
`;

export interface VecFormProps extends RenderProps {
  type: IDL.Type;
  path: string;
}
export const VecForm = ({ path, type, absolutePath, ...p }: VecFormProps) => {
  const ctx = useContext(context);
  const settings = getSettings(path, absolutePath);
  const { append, remove } = useFieldArray({ name: path, control: ctx.control });

  useWatch({ name: path, control: ctx.control });
  const items = ctx.getValues(path) || [];
  const state = ctx.getFieldState(path);

  const Wrapper = path ? ShiftedColumn : Column;
  const name = settings.label || p.name;

  if (settings.hide) {
    return null;
  }

  return (
    <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
      <VecContainer>
        <VecTitle variant='p2' weight='medium' $error={state.error?.message}>
          {name}
        </VecTitle>
        <VecButton variant='caption' onClick={() => append(type.accept(new Empty(), null))}>
          +
        </VecButton>
        {!!items?.length && (
          <Column margin={16}>
            {items.map((_: any, i: number) => {
              const component = type.accept(
                new Render({
                  path: `${path}${path ? '.' : ''}${i}`,
                  absolutePath: `${absolutePath}${absolutePath ? '.' : ''}-1`,
                }),
                null,
              );

              return (
                <Wrapper key={String(i)}>
                  {component}
                  <VecButton variant='caption' onClick={() => remove(i)}>
                    -
                  </VecButton>
                </Wrapper>
              );
            })}
          </Column>
        )}
      </VecContainer>
    </AdornmentWrapper>
  );
};

export interface TupleFormProps extends RenderProps {
  fields: IDL.Type[];
  path: string;
}
export const TupleForm = ({ fields, path, absolutePath, ...p }: TupleFormProps) => {
  const ctx = useContext(context);
  const settings = getSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);

  const children = useMemo(
    () =>
      fields.map((type, i) =>
        type.accept(
          new Render({
            path: `${path}${path ? '.' : ''}${i}`,
            absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${i}`,
            key: String(i),
          }),
          null,
        ),
      ),
    [fields, path],
  );
  const name = settings.label || p.name;

  if (settings.hide) {
    return null;
  }

  return (
    <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
      <VecContainer margin={16}>
        <VecTitle variant='p2' $error={state.error?.message}>
          {name}
        </VecTitle>
        {children}
      </VecContainer>
    </AdornmentWrapper>
  );
};

export interface NullProps extends RenderProps {}
export const NullForm = (_: NullProps) => null;

export class Render extends IDL.Visitor<null, JSX.Element | null> {
  constructor(protected props: RenderProps) {
    super();
  }

  public visitType<T>(t: IDL.Type<T>, d: null) {
    return t.accept(new Editor(this.props), null);
  }
  public visitNull(t: IDL.NullClass, d: null) {
    return <NullForm {...this.props} />;
  }
  public visitRecord(t: IDL.RecordClass, fields: Array<[string, IDL.Type]>, d: null) {
    return <RecordForm {...this.props} fields={fields} />;
  }
  public visitTuple<T extends any[]>(t: IDL.TupleClass<T>, components: IDL.Type[], d: null) {
    return <TupleForm {...this.props} fields={components} />;
  }
  public visitVariant(t: IDL.VariantClass, fields: Array<[string, IDL.Type]>, d: null) {
    return <VariantForm {...this.props} fields={fields} />;
  }
  public visitOpt<T>(t: IDL.OptClass<T>, ty: IDL.Type<T>, d: null) {
    return <OptForm {...this.props} type={ty} />;
  }
  public visitVec<T>(t: IDL.VecClass<T>, ty: IDL.Type<T>, d: null) {
    return <VecForm type={ty} {...this.props} />;
  }
  public visitRec<T>(t: IDL.RecClass<T>, ty: IDL.ConstructType<T>, d: null): JSX.Element | null {
    return ty.accept<null, JSX.Element | null>(new Render(this.props), null);
  }
}
