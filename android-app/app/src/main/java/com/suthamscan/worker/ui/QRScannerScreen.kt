package com.suthamscan.worker.ui

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.suthamscan.worker.data.ApiClient
import com.suthamscan.worker.data.SecurityHelper
import com.suthamscan.worker.data.ScanRequest
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.launch
import java.time.Instant

@Composable
fun QRScannerScreen(token: String) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    
    var hasCameraPermission by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    var hasLocationPermission by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) }
    
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { perms ->
        hasCameraPermission = perms[Manifest.permission.CAMERA] ?: hasCameraPermission
        hasLocationPermission = perms[Manifest.permission.ACCESS_FINE_LOCATION] ?: hasLocationPermission
    }

    var scanStatus by remember { mutableStateOf("Ready to Scan") }
    var statusColor by remember { mutableStateOf(Color.Gray) }
    var isLoading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission || !hasLocationPermission) {
            permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION))
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Box(modifier = Modifier.weight(1f).fillMaxWidth().background(Color.Black), contentAlignment = Alignment.Center) {
            if (hasCameraPermission && hasLocationPermission) {
                // In a real app, bind AndroidX CameraX PreviewView and ML Kit BarcodeScanner here
                // For MVP structure compilation, we mock the UI scan trigger
                Text("CAMERA PREVIEW TARGET", color = Color.White)
                
                Button(onClick = { 
                    // Simulate a scan payload
                    val mockQrPayload = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenPayload" 
                    
                    isLoading = true
                    scanStatus = "Validating Geo-Location..."
                    statusColor = Color.Yellow
                    
                    try {
                        fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                            if (location == null) {
                                scanStatus = "Failed to acquire GPS lock."
                                statusColor = Color.Red
                                isLoading = false
                                return@addOnSuccessListener
                            }
                            
                            // Security Enforcement Step 1: Mock GPS Check
                            if (SecurityHelper.isMockLocation(location)) {
                                scanStatus = "MOCK LOCATION DETECTED. SCAN REJECTED."
                                statusColor = Color.Red
                                isLoading = false
                                return@addOnSuccessListener
                            }
                            
                            // Security Enforcement Step 2: Accuracy Check (<10m required)
                            if (location.accuracy > 10.0) {
                                scanStatus = "GPS signal too weak (${location.accuracy}m). Need <10m."
                                statusColor = Color.Red
                                isLoading = false
                                return@addOnSuccessListener
                            }

                            coroutineScope.launch {
                                scanStatus = "Verifying with server..."
                                try {
                                    val req = ScanRequest(
                                        qrToken = mockQrPayload,
                                        lat = location.latitude,
                                        long = location.longitude,
                                        timestamp = Instant.now().toString()
                                    )
                                    val res = ApiClient.instance.validateScan("Bearer $token", req)
                                    if (res.success) {
                                        scanStatus = "VALID. Stop Logged Successfully!"
                                        statusColor = Color.Green
                                    } else {
                                        scanStatus = "REJECTED: ${res.rejection_reason}"
                                        statusColor = Color.Red
                                    }
                                } catch (e: Exception) {
                                    scanStatus = "Network failure during validation."
                                    statusColor = Color.Red
                                } finally {
                                    isLoading = false
                                }
                            }
                        }
                    } catch (e: SecurityException) {
                        scanStatus = "Location Permission Revoked."
                        statusColor = Color.Red
                        isLoading = false
                    }

                }, modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp)) {
                    Text("SIMULATE QR SCAN")
                }

            } else {
                Text("Camera and Location permissions are required.", color = Color.White)
            }
        }

        Box(modifier = Modifier.fillMaxWidth().height(100.dp).background(statusColor).padding(16.dp), contentAlignment = Alignment.Center) {
            if (isLoading) CircularProgressIndicator(color = Color.White)
            else Text(scanStatus, color = Color.White, style = MaterialTheme.typography.titleMedium)
        }
    }
}
