package com.suthamscan.worker.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.suthamscan.worker.data.ApiClient
import com.suthamscan.worker.data.LoginRequest
import com.suthamscan.worker.data.SecurityHelper
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: (String) -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Auto-fetch device ID representing the current bound hardware
    val deviceId = remember { SecurityHelper.getDeviceId(context) }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("SuthamScan Protocol", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Sanitation Worker App", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Hardware Bound Device ID:", style = MaterialTheme.typography.labelMedium)
                Text(deviceId, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                Spacer(modifier = Modifier.height(16.dp))
                Text("Your login authorization is strictly bound to this physical device.", style = MaterialTheme.typography.bodySmall)
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        if (errorMessage != null) {
            Text(errorMessage!!, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 16.dp))
        }

        Button(
            onClick = {
                if (SecurityHelper.isDeviceRooted(context)) {
                    errorMessage = "SECURITY VIOLATION: Device is rooted. Access Denied."
                    return@Button
                }
                
                isLoading = true
                coroutineScope.launch {
                    try {
                        val response = ApiClient.instance.login(LoginRequest(device_id = deviceId))
                        if (response.success && response.token != null) {
                            onLoginSuccess(response.token)
                        } else {
                            errorMessage = response.message ?: "Authentication failed."
                        }
                    } catch (e: Exception) {
                        errorMessage = "Network error or Server offline."
                    } finally {
                        isLoading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            enabled = !isLoading
        ) {
            if (isLoading) CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
            else Text("Authenticate", fontSize = 18.sp)
        }
    }
}
