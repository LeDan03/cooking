const YearInput = ({ label, value, onChange }) => {
    return (
        <div className="flex items-center space-x-3">
            <label className="text-white font-medium">{label}:</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-28 px-3 bg-white py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={2000}
                max={new Date().getFullYear()}
            />
        </div>
    );
}
export default YearInput;