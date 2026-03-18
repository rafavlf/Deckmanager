package com.tcgmanager;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import androidx.core.content.FileProvider;
import java.io.*;

public class MainActivity extends Activity {

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int IMPORT_REQUEST = 1002;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#f8fafc"));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Ponte 1: armazenamento nativo persistente
        webView.addJavascriptInterface(new StorageBridge(this), "AndroidStorage");

        // Ponte 2: abrir URLs externas no navegador
        final Activity activity = this;
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void open(String url) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    activity.startActivity(intent);
                } catch (Exception e) { e.printStackTrace(); }
            }
        }, "AndroidBrowser");

        // Ponte 3: exportar e importar CSV
        webView.addJavascriptInterface(new Object() {

            @JavascriptInterface
            public void shareCSV(String filename, String csvContent) {
                try {
                    // Salva temporariamente e abre o share sheet nativo
                    File tempFile = new File(getCacheDir(), filename);
                    FileWriter fw = new FileWriter(tempFile);
                    fw.write(csvContent);
                    fw.close();

                    Uri uri = FileProvider.getUriForFile(
                        activity,
                        getPackageName() + ".provider",
                        tempFile
                    );

                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType("text/csv");
                    shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, filename);
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    activity.startActivity(Intent.createChooser(shareIntent, "Salvar / Compartilhar CSV"));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @JavascriptInterface
            public void pickCSV() {
                // Abre o file picker nativo para .csv
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("*/*");
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                activity.startActivityForResult(
                    Intent.createChooser(intent, "Selecionar CSV"),
                    IMPORT_REQUEST
                );
            }
        }, "AndroidExport");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        activity.startActivity(intent);
                    } catch (Exception e) { e.printStackTrace(); }
                    return true;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView wv, ValueCallback<Uri[]> cb,
                                             FileChooserParams params) {
                filePathCallback = cb;
                Intent intent = params.createIntent();
                try {
                    activity.startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST) {
            // File input do WebView (fallback)
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                results = new Uri[]{ data.getData() };
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;

        } else if (requestCode == IMPORT_REQUEST && resultCode == RESULT_OK && data != null) {
            // Import CSV via ponte nativa
            Uri uri = data.getData();
            try {
                InputStream is = getContentResolver().openInputStream(uri);
                BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                reader.close();
                final String csvText = sb.toString()
                    .replace("\\", "\\\\")
                    .replace("'", "\\'")
                    .replace("\r", "");

                // Passa o CSV para o JS
                webView.post(() -> webView.evaluateJavascript(
                    "window.onCSVImported('" + csvText + "')", null
                ));
            } catch (Exception e) {
                e.printStackTrace();
                webView.post(() -> webView.evaluateJavascript(
                    "window.showToast('Erro ao ler arquivo.','error')", null
                ));
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
