package com.example.devmastery.profile.presentation

import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.profile.data.remote.CertificateDto
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CertificatesScreen(
    onBack: () -> Unit,
    viewModel: CertificatesViewModel = viewModel(factory = CertificatesViewModel.Factory)
) {
    val state by viewModel.state.collectAsState()
    val claim by viewModel.claim.collectAsState()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    var showClaimDialog by remember { mutableStateOf(false) }

    // Surface claim result via snackbar; dismiss dialog on success.
    LaunchedEffect(claim) {
        when (val c = claim) {
            is ClaimStatus.Success -> {
                showClaimDialog = false
                snackbar.showSnackbar("Certificate claimed: ${c.pathTitle} 🎉")
                viewModel.resetClaimStatus()
            }
            is ClaimStatus.Error -> {
                snackbar.showSnackbar(c.message)
                viewModel.resetClaimStatus()
            }
            else -> Unit
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text("Certificates") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                actions = {
                    TextButton(onClick = { showClaimDialog = true }) { Text("Claim") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentAlignment = Alignment.Center
        ) {
            when (val s = state) {
                is CertificatesState.Loading -> CircularProgressIndicator()

                is CertificatesState.Empty -> Text(
                    "No certificates yet.\nComplete every topic in a path, then tap Claim.",
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(24.dp)
                )

                is CertificatesState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.load() }) { Text("Retry") }
                }

                is CertificatesState.Success -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(s.certificates, key = { it.id }) { cert ->
                        CertificateCard(
                            cert = cert,
                            onOpen = {
                                cert.pdfUrl?.takeIf { it.isNotBlank() }?.let { url ->
                                    context.startActivity(Intent(Intent.ACTION_VIEW, url.toUri()))
                                }
                            },
                            onShare = {
                                val url = cert.pdfUrl.orEmpty()
                                if (url.isBlank()) return@CertificateCard
                                scope.launch {
                                    CertificateShare
                                        .shareCertificatePdf(context, url, cert.pathTitle)
                                        .onFailure { snackbar.showSnackbar("Share failed: ${it.message ?: "unknown"}") }
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    if (showClaimDialog) {
        ClaimDialog(
            claiming = claim is ClaimStatus.Claiming,
            onDismiss = { showClaimDialog = false },
            onClaim = { slug -> viewModel.claimCertificate(slug) }
        )
    }
}

@Composable
private fun CertificateCard(
    cert: CertificateDto,
    onOpen: () -> Unit,
    onShare: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(cert.pathTitle, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
            Text(
                "Credential: ${cert.credentialId.take(8)}… · ${cert.totalTopics} topics" +
                    (cert.avgQuizScore?.let { " · avg quiz ${"%.0f".format(it)}%" } ?: ""),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            cert.issuedAt?.let {
                Text(
                    "Issued: ${it.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (!cert.pdfUrl.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onOpen) { Text("View PDF") }
                    OutlinedButton(onClick = onShare) { Text("Share") }
                }
            }
        }
    }
}

@Composable
private fun ClaimDialog(
    claiming: Boolean,
    onDismiss: () -> Unit,
    onClaim: (String) -> Unit
) {
    var pathSlug by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = { if (!claiming) onDismiss() },
        title = { Text("Claim certificate") },
        text = {
            Column {
                Text(
                    "Enter the slug of a learning path you've fully completed.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = pathSlug,
                    onValueChange = { pathSlug = it },
                    label = { Text("Path slug") },
                    placeholder = { Text("e.g. java-mastery") },
                    singleLine = true,
                    enabled = !claiming,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onClaim(pathSlug) },
                enabled = !claiming && pathSlug.isNotBlank()
            ) {
                if (claiming) {
                    CircularProgressIndicator(
                        Modifier.size(18.dp), strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Claim")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !claiming) { Text("Cancel") }
        }
    )
}

