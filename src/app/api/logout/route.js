export async function POST(request) {
  try {
    // Bersihkan cookie/token jika menggunakan cookie-based auth
    const response = new Response(JSON.stringify({
      success: true,
      message: "Logout successful"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
      }
    });

    return response;
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Logout failed"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}