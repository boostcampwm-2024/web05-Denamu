import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Helmet>
        <title>404-Not-Found</title>
        <meta name="description" content="요청한 페이지를 찾을 수 없습니다." />
      </Helmet>
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-8xl font-bold text-green-500">404</h1>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">요청하신 페이지를 찾을 수 없습니다.</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
