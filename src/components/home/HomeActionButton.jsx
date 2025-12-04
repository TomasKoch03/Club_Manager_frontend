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
        group relative flex ${horizontal ? 'flex-row items-center justify-start' : 'flex-col items-center justify-center'} w-full h-full
        rounded-2xl transition-all duration-300
        ${isDark ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-900 shadow-md border border-gray-100'}
        hover:-translate-y-1 hover:shadow-xl cursor-pointer
    `;

    const containerStyle = {
        minHeight: horizontal ? 'clamp(60px, 8vh, 100px)' : 'clamp(100px, 15vh, 180px)',
        padding: horizontal ? 'clamp(0.75rem, 2vh, 1.5rem) clamp(1rem, 2vw, 1.5rem)' : 'clamp(1rem, 2vh, 1.5rem) clamp(1rem, 2vw, 1.5rem)'
    };

    const iconStyle = {
        width: horizontal ? 'clamp(2rem, 5vw, 2.5rem)' : 'clamp(3rem, 10vw, 6rem)',
        height: horizontal ? 'clamp(2rem, 5vw, 2.5rem)' : 'clamp(3rem, 10vw, 6rem)',
        marginRight: horizontal ? 'clamp(0.75rem, 1.5vw, 1rem)' : '0',
        marginBottom: horizontal ? '0' : 'clamp(0.75rem, 2vh, 1.5rem)'
    };

    const iconClasses = `
        transition-colors duration-300
        ${isDark ? 'text-white' : getVariantStyles(variant)}
    `;

    const textStyle = {
        fontSize: horizontal ? 'clamp(0.9rem, 1.8vw, 1.125rem)' : 'clamp(1.1rem, 2.5vw, 1.5rem)'
    };

    const textClasses = `
        font-semibold ${horizontal ? 'text-left' : 'text-center'}
        ${isDark ? 'text-gray-100' : 'text-gray-900'}
    `;

    const content = (
        <>
            <Icon className={iconClasses} style={iconStyle} />
            <span className={textClasses} style={textStyle}>{text}</span>
        </>
    );

    if (href) {
        return (
            <Link to={href} className={containerClasses} style={{ textDecoration: 'none', ...containerStyle }}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={containerClasses} style={containerStyle}>
            {content}
        </button>
    );
};

export default HomeActionButton;