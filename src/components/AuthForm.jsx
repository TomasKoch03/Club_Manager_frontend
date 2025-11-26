
const AuthForm = ({
    title,
    onSubmit,
    children,
    submitText = "Enviar",
    submitVariant = "dark"
}) => {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{title}</h2>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                {children}
                <button
                    type="submit"
                    className="
                        w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white
                        bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5
                        transition-all duration-200 shadow-md hover:shadow-lg
                    "
                >
                    {submitText}
                </button>
            </form>
        </div>
    );
};

export default AuthForm;