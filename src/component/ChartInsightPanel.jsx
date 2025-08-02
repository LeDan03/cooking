const ChartInsightPanel = ({
    dataList,
    title,
    unit = 'lượt',
    isWeeklyChart = false,
    currentIndex // tuần/tháng hiện tại (1-based)
}) => {
    if (!Array.isArray(dataList) || dataList.length === 0 || !currentIndex || currentIndex < 1) return null;

    const total = dataList.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / dataList.length);

    const maxValue = Math.max(...dataList);
    const minValue = Math.min(...dataList);
    const maxIndex = dataList.findIndex(v => v === maxValue);
    const minIndex = dataList.findIndex(v => v === minValue);

    const label = isWeeklyChart ? "Tuần" : "Tháng";
    const getLabel = (index) => `${label} ${index + 1}`;

    // So sánh hiện tại - trước đó, dùng currentIndex
    const canCompare = currentIndex >= 2
        && dataList[currentIndex - 1] != null
        && dataList[currentIndex - 2] != null;

    const current = canCompare ? dataList[currentIndex - 1] : 0;
    const previous = canCompare ? dataList[currentIndex - 2] : 0;
    const delta = canCompare ? current - previous : 0;
    let percentChange;
    if (!canCompare) {
        percentChange = null;
    } else if (previous === 0 && current > 0) {
        percentChange = '∞';
    } else if (previous === 0 && current === 0) {
        percentChange = '0.0';
    } else {
        percentChange = ((delta / previous) * 100).toFixed(1);
    }
    const trendIcon = delta > 0 ? "📈" : delta < 0 ? "📉" : "➖";

    return (
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-700">
                <div className='flex items-center space-x-2 text-lg'>
                    <span>🔢 Tổng:</span> <p>{total} {unit}</p>
                </div>
                <div className='flex items-center space-x-2 text-lg'>
                    <span>📊 Trung bình {label.toLowerCase()}:</span> <p>{average} {unit}</p>
                </div>
                <div className='flex items-center space-x-2 text-lg'>
                    <span>📈 Cao nhất:</span>
                    <p className='text-yellow-600'>{getLabel(maxIndex)} ({maxValue} {unit})</p>
                </div>
                <div className='flex items-center space-x-2 text-lg'>
                    <span>📉 Thấp nhất:</span>
                    <p className='text-red-700'>{getLabel(minIndex)} ({minValue} {unit})</p>
                </div>
                {canCompare && (
                    <div className='col-span-2 flex items-center space-x-2 text-lg'>
                        <span>{trendIcon} So sánh {label.toLowerCase()}:</span>
                        <p>
                            {getLabel(currentIndex - 2)}: {previous} {unit} → {getLabel(currentIndex - 1)}: {current} {unit}
                            {' '} (
                            {delta > 0 ? '+ ' : ''}
                            {delta} {unit}, {percentChange !== null ? `${percentChange}%` : '---'}
                            )
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartInsightPanel;
