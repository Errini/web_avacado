import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service"; // Adjust path as needed

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService); // Inject AuthService
  const authToken = authService.getToken();

  // Clone the request to add the new header if token exists
  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", "Bearer " + authToken)
    });
    // Pass on the cloned request instead of the original request.
    return next(authReq);
  } else {
    // If no token, pass the original request
    return next(req);
  }
};

