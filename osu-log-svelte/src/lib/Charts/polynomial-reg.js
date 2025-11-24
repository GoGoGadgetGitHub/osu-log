//This was very vibe coded
import { multiply, transpose } from "mathjs";

function polyfit(x, y, degree) {
	const n = x.length;
	const X = [];
	const Y = y.slice();

	for (let i = 0; i < n; i++) {
		const row = [];
		for (let p = 0; p <= degree; p++) {
			row.push(Math.pow(x[i], p));
		}
		X.push(row);
	}

	// Solve (XᵀX)a = Xᵀy using Gaussian elimination
	const XT = transpose(X);
	const XTX = multiply(XT, X);
	const XTY = multiply(XT, Y);
	return gaussianElimination(XTX, XTY);
}

function gaussianElimination(A, b) {
	const n = A.length;
	for (let i = 0; i < n; i++) {
		// Pivot
		let maxRow = i;
		for (let k = i + 1; k < n; k++) {
			if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
		}
		[A[i], A[maxRow]] = [A[maxRow], A[i]];
		[b[i], b[maxRow]] = [b[maxRow], b[i]];

		// Eliminate
		for (let k = i + 1; k < n; k++) {
			const c = A[k][i] / A[i][i];
			for (let j = i; j < n; j++) {
				A[k][j] -= c * A[i][j];
			}
			b[k] -= c * b[i];
		}
	}

	// Back-substitution
	const x = Array(n).fill(0);
	for (let i = n - 1; i >= 0; i--) {
		let sum = 0;
		for (let j = i + 1; j < n; j++) {
			sum += A[i][j] * x[j];
		}
		x[i] = (b[i] - sum) / A[i][i];
	}
	return x;
}

function polyEval(coeffs, x) {
	return coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0);
}

export function generateRegressionLine(x, y, degree, samples = 30) {
	const pts = [];
	const step = x.length / samples;
	const coeffs = polyfit(x, y, degree);

	for (let i = 0; i <= x.length; i += step) {
		pts.push({ x: i, y: polyEval(coeffs, i) });
	}

	return pts;
}
