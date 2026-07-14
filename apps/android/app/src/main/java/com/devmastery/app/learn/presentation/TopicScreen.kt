package com.devmastery.app.learn.presentation

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.core.data.local.TokenManager
import com.devmastery.app.learn.data.remote.TopicDto
import io.noties.markwon.Markwon
import io.noties.markwon.ext.strikethrough.StrikethroughPlugin
import io.noties.markwon.ext.tables.TablePlugin
import io.noties.markwon.html.HtmlPlugin
import kotlinx.coroutines.launch
import javax.inject.Inject

// ── Tab definitions ───────────────────────────────────────────────────────────
private val TABS = listOf("Why", "Theory", "Visual", "Code", "Real World", "Interview", "Feynman", "Build", "Review")

@Composable
fun TopicScreen(
    topicSlug: String,
    onBack: () -> Unit,
    viewModel: ContentViewModel = hiltViewModel(),
) {
    LaunchedEffect(topicSlug) { viewModel.loadTopic(topicSlug) }
    val state by viewModel.topicState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val title = (state as? TopicUiState.Success)?.topic?.title ?: "Topic"
                    Text(title, maxLines = 1)
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
            )
        }
    ) { padding ->
        when (val s = state) {
            is TopicUiState.Loading -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            is TopicUiState.Error -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { Text(s.msg, color = MaterialTheme.colorScheme.error) }

            is TopicUiState.Success -> TopicPagerContent(
                topic   = s.topic,
                padding = padding,
            )
        }
    }
}

@Composable
private fun TopicPagerContent(topic: TopicDto, padding: PaddingValues) {
    val pagerState = rememberPagerState(pageCount = { TABS.size })
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().padding(top = padding.calculateTopPadding())) {
        // Tab row
        ScrollableTabRow(
            selectedTabIndex = pagerState.currentPage,
            edgePadding      = 8.dp,
        ) {
            TABS.forEachIndexed { idx, label ->
                Tab(
                    selected = pagerState.currentPage == idx,
                    onClick  = { scope.launch { pagerState.animateScrollToPage(idx) } },
                    text     = {
                        Text(
                            label,
                            style      = MaterialTheme.typography.labelLarge,
                            fontWeight = if (pagerState.currentPage == idx) FontWeight.SemiBold else FontWeight.Normal,
                        )
                    },
                )
            }
        }

        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            val layers = topic.resolvedLayers
            val content = when (page) {
                0 -> layers.why
                1 -> layers.theory
                2 -> layers.visual
                3 -> layers.code
                4 -> layers.real_world
                5 -> layers.interview
                6 -> layers.feynman
                7 -> layers.build
                8 -> layers.spaced_review
                else -> ""
            }
            // Code layer uses WebView for syntax highlighting; all others use Markwon
            if (page == 3 && content.isNotBlank()) {
                CodeWebView(content = content)
            } else {
                MarkdownPanel(markdown = content.ifBlank { "_No content yet._" })
            }
        }
    }
}

// ── Markwon text view ─────────────────────────────────────────────────────────
@Composable
fun MarkdownPanel(markdown: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val markwon = remember {
        Markwon.builder(context)
            .usePlugin(TablePlugin.create(context))
            .usePlugin(StrikethroughPlugin.create())
            .usePlugin(HtmlPlugin.create())
            .build()
    }

    AndroidView(
        factory = { android.widget.TextView(it).apply {
            setPadding(48, 32, 48, 32)
            textSize = 15f
        }},
        update  = { tv -> markwon.setMarkdown(tv, markdown) },
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    )
}

// ── WebView for code with highlight.js ───────────────────────────────────────
@Composable
fun CodeWebView(content: String) {
    val html = buildCodeHtml(content)
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                webViewClient = WebViewClient()
                settings.javaScriptEnabled = true
            }
        },
        update  = { wv -> wv.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null) },
        modifier = Modifier.fillMaxSize(),
    )
}

private fun buildCodeHtml(content: String): String = """
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>hljs.highlightAll();</script>
<style>
  body { font-family: monospace; background:#0d1117; color:#e6edf3; padding:16px; margin:0; font-size:14px; }
  pre  { overflow-x:auto; border-radius:8px; }
  code { font-size:13px; }
</style>
</head><body>
<pre><code>${content.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")}</code></pre>
</body></html>
""".trimIndent()
