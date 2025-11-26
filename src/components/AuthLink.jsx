import { Link } from 'react-router-dom';

const AuthLink = ({ text, linkText, to, controlId }) => {
    return (
        <div className="text-center mt-4 text-sm text-gray-600">
            {text}{' '}
            <Link
                to={to}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
                {linkText}
            </Link>
        </div>
    );
};

export default AuthLink;