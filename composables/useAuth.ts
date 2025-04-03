import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

interface User {
	username: string;
	password: string;
	createdAt: number;
}

let first = true;
export const useAuth = () => {
	const user = useState<User | null>("user", () => null);
	const users = useState<User[]>("users", () => []);
	if (first) {
		first = false;
		(async () => {
			const { value } = await Preferences.get({ key: "users" });
			if (value && value.length > 0) {
				users.value = JSON.parse(value) || [];
				console.log(users.value);
			}
		})();
	}

	watch(
		users,
		() => {
			console.log(`saving ${users.value.length} users to preferences`);
			Preferences.set({
				key: "users",
				value: JSON.stringify(users.value),
			});
		},
		{ deep: true },
	);

	async function isBiometricsAvailable() {
		if (!Capacitor.isNativePlatform()) {
			return false;
		}
		try {
			const result = await NativeBiometric.isAvailable();
			return result.isAvailable;
		} catch (error) {
			console.error("Error checking biometrics availability:", error);
			return false;
		}
	}

	async function authenticateWithBiometrics(username: string) {
		await NativeBiometric.verifyIdentity({
			reason: "Authentication",
			title: "Biometric Authentication",
		});

		// Get stored credentials
		const credentials = await NativeBiometric.getCredentials({
			server: "swifty-protein",
		});

		const u = users.value.find(
			(u) =>
				u.username === username &&
				username === credentials.username &&
				u.password === credentials.password,
		);
		if (u) {
			console.log("sucessfully authenticated with biometrics, user", username);
			user.value = u;
		} else {
			throw new Error("Biometric credentials do not match");
		}
	}

	function authenticateWithPassword(username: string, password: string) {
		const u = users.value.find(
			(u) => u.username === username && u.password === password,
		);

		if (u) {
			console.log("sucessfully authenticated with password, user", username);
			user.value = u;
		} else {
			throw new Error("Invalid username or password");
		}
	}

	async function registerUser(username: string, password: string) {
		if (users.value.some((user) => user.username === username)) {
			throw new Error("Username already exists");
		}

		const newUser: User = {
			username,
			password,
			createdAt: Date.now(),
		};

		users.value.push(newUser);

		if (await isBiometricsAvailable()) {
			await NativeBiometric.setCredentials({
				username,
				password,
				server: "swifty-protein",
			});
		}
	}

	function logout() {
		user.value = null;
		navigateTo("/");
	}

	return {
		user,
		users,
		isBiometricsAvailable,
		authenticateWithBiometrics,
		authenticateWithPassword,
		registerUser,
		logout,
	};
};
