import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { ref, watch } from "vue";

interface User {
	username: string;
	password: string;
	createdAt: number;
}

const users = ref<User[]>([]);
const user = ref<User | null>(null);
let isInitialized = false;

export const useAuth = () => {
	const initialize = async () => {
		if (isInitialized) return;
		isInitialized = true;

		try {
			const { value } = await Preferences.get({ key: "users" });
			if (value) {
				try {
					users.value = JSON.parse(value);
				} catch (parseError) {
					users.value = [];
				}
			} else {
				users.value = [];
			}
		} catch (e) {
			users.value = [];
		}

		watch(
			users,
			async (newUsers) => {
				try {
					await Preferences.set({
						key: "users",
						value: JSON.stringify(newUsers),
					});
				} catch (saveError) {
					console.error("Error saving users to preferences:", saveError);
				}
			},
			{ deep: true },
		);
	};

	if (!isInitialized) {
		initialize();
	}

	async function isBiometricsAvailable(): Promise<boolean> {
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

	async function authenticateWithBiometrics(username: string): Promise<void> {
		if (!username) {
			throw new Error("Username is required for biometric authentication.");
		}

		try {
			await NativeBiometric.verifyIdentity({
				reason: `Log in as ${username}`,
				title: "Biometric Authentication",
			});
		} catch (verifyError) {
			throw new Error("Biometric verification failed.");
		}

		try {
			const credentials = await NativeBiometric.getCredentials({
				server: username,
			});

			const foundUser = users.value.find(
				(u) =>
					u.username === username &&
					credentials.username === username &&
					u.password === credentials.password,
			);

			if (foundUser) {
				user.value = foundUser;
			} else {
				throw new Error("Biometric credentials do not match stored user data.");
			}
		} catch (credentialError) {
			throw new Error(
				`Could not retrieve biometric credentials for ${username}. Has biometrics been set up for this account?`,
			);
		}
	}

	function authenticateWithPassword(username: string, password: string): void {
		const foundUser = users.value.find(
			(u) => u.username === username && u.password === password,
		);

		if (foundUser) {
			user.value = foundUser;
		} else {
			throw new Error("Invalid username or password.");
		}
	}

	async function registerUser(
		username: string,
		password: string,
	): Promise<void> {
		if (users.value.some((u) => u.username === username)) {
			throw new Error("Username already exists.");
		}

		const newUser: User = {
			username,
			password,
			createdAt: Date.now(),
		};

		users.value.push(newUser);

		if (await isBiometricsAvailable()) {
			try {
				await NativeBiometric.setCredentials({
					username: username,
					password: password,
					server: username,
				});
			} catch (setCredentialError) {
				console.error(
					`Failed to set biometric credentials for ${username}:`,
					setCredentialError,
				);
			}
		}
	}

	function logout(): void {
		user.value = null;
	}

	async function deleteUser(username: string): Promise<void> {
		const userIndex = users.value.findIndex((u) => u.username === username);
		if (userIndex === -1) {
			return;
		}

		users.value.splice(userIndex, 1);

		if (user.value?.username === username) {
			logout();
		}

		if (Capacitor.isNativePlatform()) {
			try {
				await NativeBiometric.deleteCredentials({ server: username });
			} catch (deleteError) {
				console.warn(
					`Could not delete biometric credentials for ${username} (may not have existed):`,
					deleteError,
				);
			}
		}
	}

	return {
		user,
		users,
		isBiometricsAvailable,
		authenticateWithBiometrics,
		authenticateWithPassword,
		registerUser,
		logout,
		deleteUser,
	};
};
