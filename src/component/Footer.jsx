const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cột 1: Tác giả */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Thông tin tác giả</h3>
          <p className="text-sm">Lê Yến Đan</p>
          <p className="text-sm">MSSV: DH52101497</p>
        </div>

        {/* Cột 2: Liên hệ */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Liên hệ</h3>
          <p className="text-sm">📞 0839 003 848</p>
          <p className="text-sm">
            📧 <a href="mailto:leyendanwork@gmail.com" className="hover:underline text-blue-300">
              leyendanwork@gmail.com
            </a>
          </p>
        </div>

        {/* Cột 3: Bản quyền hoặc logo nếu cần */}
        <div className="flex flex-col items-start lg:items-end justify-between">
          <p className="text-sm mt-4 lg:mt-0">&copy; 2025 HealthyWealthy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
