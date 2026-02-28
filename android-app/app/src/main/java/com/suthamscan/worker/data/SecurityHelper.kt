package com.suthamscan.worker.data

import android.content.Context
import android.location.Location
import android.provider.Settings
import com.scottyab.rootbeer.RootBeer

object SecurityHelper {
    
    // 1. Root Detection
    fun isDeviceRooted(context: Context): Boolean {
        val rootBeer = RootBeer(context)
        return rootBeer.isRooted // Checks for su binaries, dangerous props, magisk, etc.
    }

    // 2. Mock GPS Detection
    fun isMockLocation(location: Location): Boolean {
        return location.isMock
    }

    // 3. Fallback System Settings Mock Location Check
    fun isMockSettingsEnabled(context: Context): Boolean {
        return try {
            Settings.Secure.getString(context.contentResolver, Settings.Secure.ALLOW_MOCK_LOCATION) == "1"
        } catch (e: Exception) {
            false
        }
    }

    // 4. Get Unique Device ID securely (For Device Binding)
    // In production, Widevine ID or Android KeyStore attestation is preferred.
    fun getDeviceId(context: Context): String {
        return Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "UNKNOWN_DEVICE"
    }
}
