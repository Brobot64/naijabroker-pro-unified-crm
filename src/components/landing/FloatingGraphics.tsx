
const FloatingGraphics = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-100 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute bottom-40 left-16 w-40 h-40 bg-blue-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-indigo-50 rounded-full opacity-20 animate-bounce delay-500"></div>
    </div>
  );
};

export default FloatingGraphics;
