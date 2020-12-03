
export interface FormComponent {
    pristineAndUntouched: boolean;
    invalid: boolean;
    save(forSaving: any): any;
    clear(): void;
}