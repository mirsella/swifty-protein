export default defineNuxtRouteMiddleware(async (to, _from) => {
	const { user } = useAuth();

	// If not authenticated and not on index (login) page, redirect to login
	if (!user.value && !to.path.startsWith("/users")) {
		console.error("ALLOWING NON LOGGED IN USER FOR DEVELOPMENT");
		// return navigateTo("/users");
	}
});
