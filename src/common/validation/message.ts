import { ValidationArguments } from 'class-validator';

export const validationLengthMessage = (args: ValidationArguments) => {
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}글자를 입력해주세요.`;
  } else {
    return `${args.property}는 최소 ${args.constraints[0]}글자를 입력 해주세요.`;
  }
};

export const validationStringMessage = (args: ValidationArguments) => {
  return `${args.property}을 입력해주세요.`;
};

export const validationEmailMessage = (args: ValidationArguments) => {
  return `${args.property}에 정확한 이메일을 입력해주세요.`;
};
