import { FC, ReactNode } from 'react';
import { isEmpty } from '../utils';
interface ButtonWithResultProps {
  action: () => void;
  result?: any;
  label: string;
  resultIsJson?: boolean;
  children?: ReactNode;
}

const ButtonWithResult: FC<ButtonWithResultProps> = ({
  action,
  result = '',
  label,
  resultIsJson = false,
  children,
}) => {
  function replacer(key: string, value: any) {
    if (typeof value === 'bigint') {
      return {
        type: 'bigint',
        value: value.toString(),
      };
    } else {
      return value;
    }
  }
  const resultString = (result: any) => JSON.stringify(result, replacer);

  return (
    <>
      <div>
        <button onClick={action}>
          <span>{label}</span>
        </button>
        {children}
      </div>
      {!isEmpty(result) && (
        <code>
          {label}: {resultIsJson ? resultString(result) : result}
        </code>
      )}
    </>
  );
};

export default ButtonWithResult;
