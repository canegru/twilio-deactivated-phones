const validateEnvironment = (items: string[]): boolean => {
    items.forEach((variable) => {
        if (!process.env[variable]) throw new Error(`Missing env variable ${variable}`);
    });
    return true;
};

export default validateEnvironment;
