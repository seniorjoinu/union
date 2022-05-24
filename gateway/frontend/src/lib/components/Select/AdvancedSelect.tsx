import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text, getFontStyles } from '../Text';
import { Row, Column } from '../Layout';
import { withBorder } from '../withBorder';
import { useClickOutside } from '../useClickOutside';
import { Mark } from './Mark';

const Icon = styled(Mark)``;

const Tooltip = withBorder(
  styled(Column)`
    list-style-type: none;
    background-color: ${({ theme }) => theme.colors.light};
  `,
  {
    quadFillColor: 'rgba(0, 0,0, 0)',
  },
);

const Selected = styled(Text)`
  white-space: pre;
  ${getFontStyles('p3', 'regular')}
`;
const Placeholder = styled(Text)`
  ${getFontStyles('p3', 'regular')}
  color: ${({ theme }) => theme.colors.grey};
`;

const SelectContainer = withBorder(
  styled(Row)`
    position: relative;
    min-height: 32px;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 0 4px;
    cursor: pointer;

    ${Selected} {
      flex-grow: 1;
    }

    ${Icon} {
      position: absolute;
      bottom: 8px;
      right: 8px;
      flex-shrink: 0;
      height: 9px;
      width: 9px;
      transition: color 0.2s, transform 0.2s ease;
      color: ${({ theme }) => theme.colors.dark};
    }
  `,
  { withQuad: false },
);

const HelperText = styled(Text)`
  color: red;
`;

const Label = styled(Text)`
  ${getFontStyles('p3', 'medium')}
`;

const Container = styled.div<{ $disabled: boolean; $opened: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'all')};
  opacity: ${({ $disabled }) => ($disabled ? '0.5' : '1')};

  &:hover {
    ${Icon} {
      color: ${({ theme }) => theme.colors.grey};
    }
  }

  ${Label} {
    margin-bottom: 4px;
  }

  ${HelperText} {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    transform: translateY(100%);
  }

  ${Tooltip} {
    position: absolute;
    z-index: 2;
    bottom: 1px;
    left: 0;
    right: 8px;
    transform: translateY(100%);
    opacity: ${({ $opened }) => ($opened ? '1' : '0')};
    pointer-events: ${({ $opened }) => ($opened ? 'all' : 'none')};
    transition: opacity 0.2s ease;

    & > div {
      max-height: 400px;
      overflow: auto;
      z-index: 100;
    }
  }

  ${SelectContainer} ${Icon} {
    transform: ${({ $opened }) => ($opened ? 'rotate(0)' : 'rotate(45deg)')};
  }
`;

export const advancedSelectLayout = {
  Container,
  Label,
  HelperText,
  SelectContainer,
  Selected,
  Tooltip,
  Icon,
};

const ctx = createContext<{ onChange(value: string, obj: any): void; value: string[] }>({
  onChange: () => {},
  value: [],
});

// TODO clickoutside
export interface AdvancedSelectProps {
  className?: string;
  style?: React.CSSProperties;
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  multiselect?: boolean;
  helperText?: string | undefined | null;
  children?: React.ReactNode;
  isDefaultOpened?: boolean;
  value: string[];
  element?: React.ReactNode;
  onChange(value: string, obj: any): void;
}

export const AdvancedSelect = React.forwardRef<HTMLDivElement, AdvancedSelectProps>(
  (
    {
      className = '',
      style,
      helperText,
      label,
      placeholder,
      disabled,
      isDefaultOpened = false,
      onChange,
      children,
      value,
      element,
      multiselect = true,
    },
    ref,
  ) => {
    const [opened, setOpened] = useState(isDefaultOpened);
    const { ref: handledRef } = useClickOutside(() => setOpened(false), ref);

    const handleChange = useCallback(
      (value: string, obj: any) => {
        if (!multiselect) {
          setOpened(false);
        }
        onChange(value, obj);
      },
      [onChange, setOpened, multiselect],
    );

    return (
      <Container
        className={className}
        style={style}
        ref={handledRef}
        $disabled={!!disabled}
        $opened={opened}
      >
        {label && <Label>{label}</Label>}
        <SelectContainer onClick={() => setOpened((opened) => !opened)}>
          {element || (
            <>
              <Selected>{value.join(',\n') || <Placeholder>{placeholder}</Placeholder>}</Selected>
            </>
          )}
          <Icon />
        </SelectContainer>
        <ctx.Provider value={{ onChange: handleChange, value }}>
          <Tooltip>{children}</Tooltip>
        </ctx.Provider>
        {helperText && <HelperText variant='caption'>{helperText}</HelperText>}
      </Container>
    );
  },
);

const SelectedIcon = styled(Mark)``;

const Option = styled.li`
  position: relative;
  cursor: pointer;
  margin: 0;
  padding: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }

  ${SelectedIcon} {
    height: 9px;
    width: 9px;
    margin-right: 4px;
    transform: rotate(45deg);
  }

  & > ${Text} {
    transition: color 0.2s ease;
    color: ${({ theme }) => theme.colors.dark};
  }

  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export interface AdvancedOptionProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value: string;
  obj: any;
}

export const AdvancedOption = ({ value, obj, ...p }: AdvancedOptionProps) => {
  const { onChange, value: selected } = useContext(ctx);

  return (
    <Option {...p} onClick={() => onChange(value, obj)}>
      {selected.includes(value) && <SelectedIcon />}
      <Text variant='p3'>{value}</Text>
    </Option>
  );
};
