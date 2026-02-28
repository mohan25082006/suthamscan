package com.suthamscan.worker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.suthamscan.worker.ui.LoginScreen
import com.suthamscan.worker.ui.QRScannerScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var authToken by remember { mutableStateOf<String?>(null) }
                    
                    if (authToken == null) {
                        LoginScreen(onLoginSuccess = { token ->
                            authToken = token
                        })
                    } else {
                        // After successful device-bound JWT authentication, enter the scanner view
                        QRScannerScreen(token = authToken!!)
                    }
                }
            }
        }
    }
}
