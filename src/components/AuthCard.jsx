
const AuthCard = ({
    children,
    className = ""
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className={`
                w-full max-w-xl bg-white rounded-2xl shadow-xl p-10
                border border-gray-100
                ${className}
            `}>
                {children}
            </div>
        </div>
    );
};

export default AuthCard;