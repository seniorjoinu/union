import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import {
  Field,
  Text,
  Column as C,
  ShiftedColumn as SC,
  Button,
  AdvancedSelect,
  AdvancedOption,
  Checkbox,
  getFontStyles,
} from '@union/components';
import styled from 'styled-components';
import { useWatch, useFieldArray, get } from 'react-hook-form';
import { Empty, SettingsWrapper, getSettings } from '../utils';
import { RenderProps, context, transformName, useSettings } from './utils';
import { Editor } from './editors';

const Column = styled(C)`
  &:empty {
    display: none;
  }
`;
const ShiftedColumn = styled(SC)`
  &:empty {
    display: none;
  }
`;

export interface OptFormProps extends RenderProps {
  type: IDL.Type;
  path: string;
}
export const OptForm = ({ type, path, absolutePath, ...p }: OptFormProps) => {
  const ctx = useContext(context);
  const settings = useSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);
  const enabled = !!ctx.getValues(path)?.length;

  const disabled = useMemo(() => p.disabled || settings.disabled, [p.disabled, settings.disabled]);
  const name = useMemo(() => (typeof settings.label == 'string' ? settings.label : p.name), [
    settings.label,
    p.name,
  ]);

  const component = useMemo(
    () =>
      type.accept(
        new RenderEditor({
          path: `${path}${path ? '.' : ''}0`,
          absolutePath: `${absolutePath}${absolutePath ? '.' : ''}0`,
          disabled,
        }),
        null,
      ),
    [type, path, absolutePath, settings, disabled],
  );

  const defaultValue = useMemo(
    () =>
      (!ctx.settings.defaultValue
        ? type.accept(new Empty(), null)
        : get(ctx.settings.defaultValue, `${path}${path ? '.' : ''}0`)),
    [ctx.settings.defaultValue, path, type],
  );

  useEffect(() => {
    if (enabled) {
      return;
    }
    ctx.setValue(path, []);
  }, []);

  return (
    <Column>
      <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
        <Checkbox
          onChange={() =>
            ctx.setValue(path, !enabled ? [defaultValue] : [], {
              shouldValidate: true,
            })
          }
          checked={enabled}
          disabled={disabled}
          helperText={state.error?.message}
        >
          {name}
        </Checkbox>
        {enabled && <ShiftedColumn $disabled={disabled}>{component}</ShiftedColumn>}
      </SettingsWrapper>
    </Column>
  );
};

export interface RecordFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const RecordForm = ({ fields, path, absolutePath, ...p }: RecordFormProps) => {
  const ctx = useContext(context);
  const settings = useSettings(path, absolutePath);

  // useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);
  // const state = {} as any;

  const fieldOrders = useMemo(
    () =>
      fields.reduce((acc, f) => {
        const fieldPath = `${path}${path ? '.' : ''}${f[0]}`;
        const fieldAbsPath = `${absolutePath}${absolutePath ? '.' : ''}-1`;
        const s = getSettings(fieldPath, fieldAbsPath, ctx.settings);

        return { ...acc, [fieldPath]: s?.order || 100 };
      }, {} as Record<string, number>),
    [absolutePath, path, ctx.settings, fields],
  );

  const orderedFields = useMemo(
    () =>
      fields.sort((a, b) => {
        const aOrder = fieldOrders[`${path}${path ? '.' : ''}${a[0]}`] || 100;
        const bOrder = fieldOrders[`${path}${path ? '.' : ''}${b[0]}`] || 100;

        return aOrder - bOrder;
      }),
    [fields, fieldOrders],
  );

  const Wrapper = useMemo(() => (path ? ShiftedColumn : Column), [path]);
  const name = useMemo(() => (typeof settings.label == 'string' ? settings.label : p.name), [
    settings.label,
    p.name,
  ]);
  const disabled = useMemo(() => p.disabled || settings.disabled, [p.disabled, settings.disabled]);

  // TODO upgrade order to indexed
  return (
    <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
      <Field
        title={name}
        weight={{ title: 'medium' }}
        helperText={state.error?.message}
        disabled={disabled}
      >
        <Wrapper margin={16}>
          {orderedFields.map(([key, field]) => {
            const currentPath = `${path}${path ? '.' : ''}${key}`;

            return field.accept(
              new RenderEditor({
                path: currentPath,
                absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${key}`,
                key: currentPath,
                name: ctx.transformLabel(key, transformName),
                disabled,
              }),
              null,
            );
          })}
        </Wrapper>
      </Field>
    </SettingsWrapper>
  );
};

export interface VariantFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const VariantForm = ({ fields, path, absolutePath, ...p }: VariantFormProps) => {
  const ctx = useContext(context);
  const settings = useSettings(path, absolutePath);

  useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);
  const value = ctx.getValues(path) || {};

  const selected = useMemo(() => {
    const keys = Object.keys(value);

    return fields.find(([key]) => key == keys[0]) || null;
  }, [value, fields]);

  const Wrapper = useMemo(() => (path ? ShiftedColumn : Column), [path]);
  const disabled = useMemo(() => p.disabled || settings.disabled, [p.disabled, settings.disabled]);
  const name = useMemo(() => (typeof settings.label == 'string' ? settings.label : p.name), [
    settings.label,
    p.name,
  ]);

  const selectedItem = useMemo(() => {
    if (!selected) {
      return null;
    }

    return selected[1].accept(
      new RenderEditor({
        path: `${path}${path ? '.' : ''}${selected[0]}`,
        absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${selected[0]}`,
        name: ctx.transformLabel(selected[0], transformName),
        disabled,
      }),
      null,
    );
  }, [selected, fields, ctx.transformLabel, path, absolutePath, disabled]);

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

  return (
    <Column>
      <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
        <AdvancedSelect
          label={name}
          onChange={handleChange}
          value={selected ? [selected[0]] : []}
          disabled={disabled}
          multiselect={false}
          placeholder='Select variant'
          helperText={state.error?.message}
        >
          {fields.map((field) => (
            <AdvancedOption key={field[0]} value={field[0]} obj={field} />
          ))}
        </AdvancedSelect>
        <Wrapper>{selectedItem}</Wrapper>
      </SettingsWrapper>
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
  const settings = useSettings(path, absolutePath);
  const { append, remove } = useFieldArray({ name: path, control: ctx.control });

  // useWatch({ name: path, control: ctx.control });
  const items = ctx.getValues(path) || [];
  const state = ctx.getFieldState(path);

  // const Wrapper = path ? ShiftedColumn : Column;
  const Wrapper = ShiftedColumn;
  const disabled = useMemo(() => p.disabled || settings.disabled, [p.disabled, settings.disabled]);
  const name = useMemo(() => (typeof settings.label == 'string' ? settings.label : p.name), [
    settings.label,
    p.name,
  ]);

  const handleAppend = useCallback(() => {
    const item = type.accept(new Empty(), null);

    append(Array.isArray(item) ? [item] : item);
  }, [append, type]);

  return (
    <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
      <VecContainer>
        <VecTitle variant='p2' weight='medium' $error={state.error?.message}>
          {name}
        </VecTitle>
        <VecButton variant='caption' onClick={handleAppend} disabled={disabled}>
          +
        </VecButton>
        {!!items?.length && (
          <Column margin={16} $disabled={disabled}>
            {items.map((_: any, i: number) => {
              const component = type.accept(
                new RenderEditor({
                  path: `${path}${path ? '.' : ''}${i}`,
                  absolutePath: `${absolutePath}${absolutePath ? '.' : ''}-1`,
                  disabled,
                }),
                null,
              );

              return (
                <Wrapper key={String(i)} withSeparator={false}>
                  {component}
                  <VecButton variant='caption' onClick={() => remove(i)} disabled={disabled}>
                    -
                  </VecButton>
                </Wrapper>
              );
            })}
          </Column>
        )}
      </VecContainer>
    </SettingsWrapper>
  );
};

export interface TupleFormProps extends RenderProps {
  fields: IDL.Type[];
  path: string;
}
export const TupleForm = ({ fields, path, absolutePath, ...p }: TupleFormProps) => {
  const ctx = useContext(context);
  const settings = useSettings(path, absolutePath);

  // useWatch({ name: path, control: ctx.control });
  const state = ctx.getFieldState(path);

  const disabled = useMemo(() => p.disabled || settings.disabled, [p.disabled, settings.disabled]);
  const name = useMemo(() => (typeof settings.label == 'string' ? settings.label : p.name), [
    settings.label,
    p.name,
  ]);

  const children = useMemo(
    () =>
      fields.map((type, i) =>
        type.accept(
          new RenderEditor({
            path: `${path}${path ? '.' : ''}${i}`,
            absolutePath: `${absolutePath}${absolutePath ? '.' : ''}${i}`,
            key: String(i),
            disabled,
          }),
          null,
        ),
      ),
    [fields, path, settings],
  );

  return (
    <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
      <VecContainer margin={16} $disabled={disabled}>
        <VecTitle variant='p2' $error={state.error?.message}>
          {name}
        </VecTitle>
        {children}
      </VecContainer>
    </SettingsWrapper>
  );
};

export const NullForm = (_: RenderProps) => null;

export class RenderEditor extends IDL.Visitor<null, JSX.Element | null> {
  constructor(protected props: RenderProps) {
    super();
  }

  public visitType<T>(t: IDL.Type<T>) {
    return t.accept(new Editor(this.props), null);
  }
  public visitNull(t: IDL.NullClass) {
    return <NullForm {...this.props} />;
  }
  public visitRecord(t: IDL.RecordClass, fields: Array<[string, IDL.Type]>) {
    return <RecordForm {...this.props} fields={fields} />;
  }
  public visitTuple<T extends any[]>(t: IDL.TupleClass<T>, components: IDL.Type[]) {
    return <TupleForm {...this.props} fields={components} />;
  }
  public visitVariant(t: IDL.VariantClass, fields: Array<[string, IDL.Type]>) {
    return <VariantForm {...this.props} fields={fields} />;
  }
  public visitOpt<T>(t: IDL.OptClass<T>, ty: IDL.Type<T>) {
    return <OptForm {...this.props} type={ty} />;
  }
  public visitVec<T>(t: IDL.VecClass<T>, ty: IDL.Type<T>) {
    return <VecForm type={ty} {...this.props} />;
  }
  public visitRec<T>(t: IDL.RecClass<T>, ty: IDL.ConstructType<T>): JSX.Element | null {
    return ty.accept<null, JSX.Element | null>(new RenderEditor(this.props), null);
  }
}
