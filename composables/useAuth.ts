import { ref } from "vue";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Preferences } from "@capacitor/preferences";

interface User {
	id: string;
	username: string;
	password: string;
	createdAt: Date;
}

export const useAuth = async () => {
	const user = ref<User | null>(null);
	const users = ref<User[]>([]);

	const { value } = await Preferences.get({ key: "users" });
	if (value) {
		users.value = JSON.parse(value);
	}

	watchEffect(async () => {
		Preferences.set({
			key: "users",
			value: JSON.stringify(users.value),
		});
	});

	async function isBiometricsAvailable() {
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
			user.value = u;
			return true;
		}
		return false;
	}

	async function registerUser(username: string, password: string) {
		if (users.value.some((user) => user.username === username)) {
			throw new Error("Username already exists");
		}

		const newUser: User = {
			id: Date.now().toString(),
			username,
			password,
			createdAt: new Date(),
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
