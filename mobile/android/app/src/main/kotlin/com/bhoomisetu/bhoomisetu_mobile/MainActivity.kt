package com.bhoomisetu.bhoomisetu_mobile

import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "bhoomisetu/security"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Channel used by Flutter to query Android's Developer Options flag.
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName).setMethodCallHandler { call, result ->
            when (call.method) {
                "isDeveloperModeEnabled" -> {
                    val enabled = isDeveloperModeEnabled()
                    result.success(enabled)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun isDeveloperModeEnabled(): Boolean {
        // Android stores the developer mode flag in Settings.Global.
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            Settings.Global.getInt(contentResolver, Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) != 0
        } else {
            @Suppress("DEPRECATION")
            Settings.Secure.getInt(contentResolver, Settings.Secure.DEVELOPMENT_SETTINGS_ENABLED, 0) != 0
        }
    }
}
