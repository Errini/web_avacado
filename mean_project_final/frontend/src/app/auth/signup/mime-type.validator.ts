import { AbstractControl, ValidationErrors, AsyncValidatorFn } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType: AsyncValidatorFn = (
  control: AbstractControl
): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
  if (typeof(control.value) === 'string') {
    return of(null); // If it's already a string (URL), assume it's valid (e.g., when editing)
  }
  const file = control.value as File;
  if (!file) {
    return of(null); // If no file, let required validator handle it
  }
  const fileReader = new FileReader();
  const frObs = new Observable(
    (observer: Observer<ValidationErrors | null>) => {
      fileReader.addEventListener("loadend", () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
        let header = "";
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        // Check for common image mime types
        switch (header) {
          case "89504e47": // png
            isValid = true;
            break;
          case "ffd8ffe0": // jpg/jpeg
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; // Or you can check other types
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};

