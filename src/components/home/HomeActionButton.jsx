import { Link } from 'react-router-dom';

// Helper to get colors based on variant
const getVariantStyles = (variant) => {
    switch (variant) {
        case 'football':
            return 'text-green-600 group-hover:text-green-700';
        case 'paddle':
        case 'tennis':
            return 'text-yellow-600 group-hover:text-yellow-700';
        case 'basketball':
            return 'text-orange-600 group-hover:text-orange-700';
        case 'dark':
            return 'text-white';
        default:
            return 'text-blue-600 group-hover:text-blue-700';
    }
};

const HomeActionButton = ({ icon: Icon, text, onClick, href, variant = 'default', horizontal = false }) => {
    const isDark = variant === 'dark';

    const containerClasses = `
        group relative flex ${horizontal ? 'flex-row items-center justify-start' : 'flex-col items-center justify-center'} w-full h-full ${horizontal ? 'min-h-[80px]' : 'min-h-[140px]'} py-6 px-6
        rounded-2xl transition-all duration-300
        ${isDark ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-900 shadow-md border border-gray-100'}
        hover:-translate-y-1 hover:shadow-xl cursor-pointer
    `;

    const iconClasses = `
        ${horizontal ? 'w-10 h-10 mr-4' : 'w-24 h-24 mb-6'} transition-colors duration-300
        ${isDark ? 'text-white' : getVariantStyles(variant)}
    `;

    const textClasses = `
        ${horizontal ? 'text-lg' : 'text-2xl'} font-semibold ${horizontal ? 'text-left' : 'text-center'}
        ${isDark ? 'text-gray-100' : 'text-gray-900'}
    `;

    const content = (
        <>
            <Icon className={iconClasses} />
            <span className={textClasses}>{text}</span>
        </>
    );

    if (href) {
        return (
            <Link to={href} className={containerClasses} style={{ textDecoration: 'none' }}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={containerClasses}>
            {content}
        </button>
    );
};

export default HomeActionButton;