Changes for both Mobile and Web

Changes:

Login/Signup: 
- Design profissional email body with otp and reset password body at backend level

Errors:
- Updated my .env file configuration but Still Email(Send verification code and Resend code) not working/sending
- Actually we are going to use Brevo service still it is showing Firebase related issue
message: "OTP will be sent to your email via Firebase. Use Firebase SDK on client to receive OTP."
success: true

=================================================================
- Use Logo to apk and ios file icon

Mobile:
- DioException [connection error]: The connection errored: Connection refused this indicates an error which most likely cannot be solved by the library. Error: SocketConnection refused (OS Error:Connection refused, errno = 111), address = localhost, port = 46764

- Google Sign-In not yet implemented. Social login packages need to be added

EXCEPTION CAUGHT BY RENDERING LIBRARY 
The following assertion was thrown during performLayout():
'package:flutter/src/rendering/stack.dart': Failed assertion: line 600 pos 12: 'size.isFinite': is not true.

Failed to initialize Firebase:
ClientException with SocketException: Connection refused
address = localhost
port = 39042
uri = http://localhost:3000/api/config/firebase
Connection refused (errno = 111)


Google sign-in failed: Firebase is not Initialized. Please ensure Firebase.initializeApp() is called first. (For web it is working fine)

sudo systemctl status postgresql
sudo systemctl restart postgresql