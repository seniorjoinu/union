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
import { Empty, RenderProps, context } from './utils';

export interface OptFormProps extends RenderProps {
  type: IDL.Type;
  path: string;
}
export const OptForm = ({ type, name, path }: OptFormProps) => {
  const { control, getValues, setValue, getFieldState } = useContext(context);

  useWatch({ name: path, control });
  const state = getFieldState(path);
  const enabled = !!getValues(path)?.length;

  const component = useMemo(
    () =>
      type.accept(
        new Render({
          path: `${path}${path ? '.' : ''}0`,
        }),
        null,
      ),
    [type, path],
  );

  return (
    <Column>
      <Checkbox
        onChange={() =>
          setValue(path, !enabled ? [type.accept(new Empty(), null)] : [], { shouldValidate: true })
        }
        checked={enabled}
        helperText={state.error?.message}
      >
        {name}
      </Checkbox>
      {enabled && <ShiftedColumn>{component}</ShiftedColumn>}
    </Column>
  );
};

export interface RecordFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const RecordForm = ({ fields, path, name }: RecordFormProps) => {
  const { control, getFieldState } = useContext(context);

  useWatch({ name: path, control });
  const state = getFieldState(path);

  return (
    <Field title={name} helperText={state.error?.message}>
      <Column margin={16}>
        {fields.map(([key, field]) => {
          const currentPath = `${path}${path ? '.' : ''}${key}`;

          return field.accept(
            new Render({
              path: currentPath,
              key: currentPath,
              name: key,
            }),
            null,
          );
        })}
      </Column>
    </Field>
  );
};

export interface VariantFormProps extends RenderProps {
  fields: Array<[string, IDL.Type]>;
  path: string;
}
export const VariantForm = ({ fields, path, name }: VariantFormProps) => {
  const { control, setValue, getValues, getFieldState } = useContext(context);

  useWatch({ name: path, control });
  const state = getFieldState(path);
  const value = getValues(path) || {};

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
        name: selected[0],
      }),
      null,
    );
  }, [selected, fields]);

  const handleChange = useCallback(
    (_: string, field: [string, IDL.Type]) => {
      setValue(path, { [field[0]]: field[1].accept(new Empty(), null) }, { shouldValidate: true });
    },
    [setValue],
  );

  const Wrapper = path ? ShiftedColumn : Column;

  return (
    <Column>
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
    </Column>
  );
};

export const VecTitle = styled(Text)<{ $error?: string }>`
  position: relative;
  &&& {
    margin-bottom: 16px;
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
export const VecForm = ({ path, type, name }: VecFormProps) => {
  const { getValues, control, getFieldState } = useContext(context);
  const { append, remove } = useFieldArray({ name: path, control: control || undefined });

  useWatch({ name: path, control });
  const items = getValues(path) || [];
  const state = getFieldState(path);

  const Wrapper = path ? ShiftedColumn : Column;

  return (
    <VecContainer>
      <VecTitle variant='p2' $error={state.error?.message}>
        {name}
      </VecTitle>
      <VecButton variant='caption' onClick={() => append(type.accept(new Empty(), null))}>
        +
      </VecButton>
      <Column margin={16}>
        {items.map((_: any, i: number) => {
          const component = type.accept(
            new Render({
              path: `${path}${path ? '.' : ''}${i}`,
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
    </VecContainer>
  );
};

export interface TupleFormProps extends RenderProps {
  fields: IDL.Type[];
  path: string;
}
export const TupleForm = ({ fields, name, path }: TupleFormProps) => {
  const { control, getFieldState } = useContext(context);

  useWatch({ name: path, control });
  const state = getFieldState(path);

  const children = useMemo(
    () =>
      fields.map((type, i) =>
        type.accept(
          new Render({
            path: `${path}${path ? '.' : ''}${i}`,
            key: String(i),
          }),
          null,
        ),
      ),
    [fields, path],
  );

  return (
    <VecContainer margin={16}>
      <VecTitle variant='p2' $error={state.error?.message}>
        {name}
      </VecTitle>
      {children}
    </VecContainer>
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
