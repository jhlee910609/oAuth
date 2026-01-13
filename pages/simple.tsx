import Link from "next/link";

export default function SimplePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-6 text-gray-800">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          👋
        </div>
        <h1 className="text-2xl font-bold mb-2">Hello, Authenticated User!</h1>
        <p className="text-gray-500 mb-8">
          이 페이지는 로그인이 되어 있어야만 볼 수 있는
          <br />
          아주 평범하고 간단한 페이지입니다.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/secure"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            토큰 상세 정보 보기
          </Link>
          <a
            href="/"
            className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            홈으로 가기
          </a>
        </div>
      </div>
    </div>
  );
}

// 중요: getServerSideProps가 없어도 미들웨어가 이미 인증을 체크했습니다!
// 그래도 명시적으로 넣는다면 빈 props라도 리턴하거나,
// 혹은 여기서 추가 데이터 페칭을 할 수도 있습니다.
export const getServerSideProps = async () => {
  return { props: {} };
};
