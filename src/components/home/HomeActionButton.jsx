
// Helper to get colors based on variant
const getVariantStyles = (variant) => {
    switch (variant) {
        case 'football':
            return 'text-green-600 group-hover:text-green-700';
        case 'paddle':
        case 'tennis':
            return 'text-orange-500 group-hover:text-orange-600';
        case 'basketball':
            return 'text-red-600 group-hover:text-red-700';
        case 'dark':
            return 'text-white';
        default:
            return 'text-blue-600 group-hover:text-blue-700';
    }
};

const HomeActionButton = ({ icon: Icon, text, onClick, href, variant = 'default' }) => {
    const isDark = variant === 'dark';

    const containerClasses = `
        group relative flex flex-col items-center justify-center w-full h-full min-h-[140px] py-6 px-6
        rounded-2xl transition-all duration-300
        ${isDark ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-900 shadow-md border border-gray-100'}
        hover:-translate-y-1 hover:shadow-xl cursor-pointer
    `;

    const iconClasses = `
        w-16 h-16 mb-4 transition-colors duration-300
        ${isDark ? 'text-white' : getVariantStyles(variant)}
    `;

    const textClasses = `
        text-lg font-semibold text-center
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
            <a href={href} className={containerClasses} style={{ textDecoration: 'none' }}>
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={containerClasses}>
            {content}
        </button>
    );
};

export default HomeActionButton;