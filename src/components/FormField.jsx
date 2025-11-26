import { useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

const FormField = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    controlId,
    className = ""
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label htmlFor={controlId} className="text-sm font-medium text-gray-700 ml-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={controlId}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
                        w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50
                        text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                        transition-all duration-200
                        ${isPassword ? 'pr-12' : ''}
                    `}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-transparent border-none focus:outline-none flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        {showPassword ? (
                            <IoEyeOffOutline size={20} />
                        ) : (
                            <IoEyeOutline size={20} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormField;