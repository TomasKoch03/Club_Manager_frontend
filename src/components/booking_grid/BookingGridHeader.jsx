import { IoChevronBack, IoChevronForward, IoInformationCircleOutline } from 'react-icons/io5';

const BookingGridHeader = ({ sport, selectedDate, formatDate, onPrevDate, onNextDate }) => {
    return (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 capitalize">{sport}</h2>

                <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
                    <button
                        onClick={onPrevDate}
                        className="p-2 rounded-full bg-transparent hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                        <IoChevronBack size={20} />
                    </button>
                    <span className="px-6 font-medium text-gray-700 min-w-[140px] text-center">
                        {formatDate(selectedDate)}
                    </span>
                    <button
                        onClick={onNextDate}
                        className="p-2 rounded-full bg-transparent hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                        <IoChevronForward size={20} />
                    </button>
                </div>                <div className="w-full md:w-auto md:min-w-[100px]"></div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-blue-800">
                <IoInformationCircleOutline size={24} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Arrastra para seleccionar:</span> Haz clic y arrastra sobre los horarios disponibles para elegir el tiempo que necesitas. Los bloques en <span className="font-semibold text-red-500">rojo</span> están ocupados.
                </p>
            </div>
        </div>
    );
};

export default BookingGridHeader;
