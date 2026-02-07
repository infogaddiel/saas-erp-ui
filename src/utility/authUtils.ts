import { Staff } from '../interfaces/Staff';

export const getAuthData = () => {
    const user = localStorage.getItem('user');
    const permissions = localStorage.getItem('permissions');

    return {
        user: user ? JSON.parse(user) as Staff : null,
        permissions: permissions ? JSON.parse(permissions) as string[] : [],
        isAuthenticated: !!localStorage.getItem('token')
    };
};

export const hasPermission = (moduleName: string): boolean => {
    const perms = localStorage.getItem('permissions');
    if (!perms) return false;

    const permissionsArray: string[] = JSON.parse(perms);
    return permissionsArray.includes(moduleName);
};

export const getModules = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const modules: any = JSON.parse(user).permissions.map((p: any) => p.menu);
        return {
            modules: modules
        }
    } else {
        return {
            modules: []
        }
    }

}

export const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

