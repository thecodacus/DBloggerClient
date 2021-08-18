import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
	providedIn: "root",
})
export class AlertService {
	constructor(private snackbar: MatSnackBar) {}
	alertError(message: string, action: string | null) {
		this.snackbar.open(message, action || "close");
	}
}
