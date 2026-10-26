declare module "@pangza/validate" {
  export class ValidationError extends Error {
    errors: any[];
    code: any;
  }
  export function validateMethodArgs(...args: any[]): Promise<void>;
  export function Validate(): MethodDecorator;
  export function NotNull(...args: any[]): PropertyDecorator;
  export function Min(...args: any[]): PropertyDecorator;
  export function Max(...args: any[]): PropertyDecorator;
  export function Email(...args: any[]): PropertyDecorator;
  export function Phone(...args: any[]): PropertyDecorator;
  export function Custom(...args: any[]): PropertyDecorator;
  export function validateHandler(...args: any[]): Promise<void>;
}
