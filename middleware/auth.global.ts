export default defineNuxtRouteMiddleware(async (to, _from) => {
	const { user } = useAuth();

	// If not authenticated and not on index (login) page, redirect to login
	if (!user.value && !to.path.startsWith("/users")) {
		return navigateTo("/users");
	}
});
