package com.bhoomisetu.bhoomisetu_mobile

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbManager
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "bhoomisetu/security"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Channel used by Flutter to query security signals.
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName).setMethodCallHandler { call, result ->
            when (call.method) {
                "isDeveloperModeEnabled" -> {
                    val enabled = isDeveloperModeEnabled()
                    result.success(enabled)
                }
                "isUsbConnectionActive" -> {
                    val connected = isUsbConnectionActive()
                    result.success(connected)
                }
                "openDeveloperOptions" -> {
                    val opened = openDeveloperOptions()
                    result.success(opened)
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

    private fun isUsbConnectionActive(): Boolean {
        // Primary check: USB_STATE broadcast flags for device/host/MTP/PTP.
        val intent = registerReceiver(null, IntentFilter("android.hardware.usb.action.USB_STATE"))
        if (intent != null) {
            val connected = intent.getBooleanExtra("connected", false)
            val configured = intent.getBooleanExtra("configured", false)
            val mtp = intent.getBooleanExtra("mtp", false)
            val ptp = intent.getBooleanExtra("ptp", false)
            val hostConnected = intent.getBooleanExtra("host_connected", false)
            if (connected || configured || mtp || ptp || hostConnected) {
                return true
            }
        }
        // Fallback: any attached USB devices.
        return try {
            @Suppress("DEPRECATION")
            val usbManager = getSystemService(Context.USB_SERVICE) as UsbManager
            usbManager.deviceList.isNotEmpty()
        } catch (_: Exception) {
            false
        }
    }

    private fun openDeveloperOptions(): Boolean {
        return try {
            // Opens the system Developer Options screen.
            val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }
}
