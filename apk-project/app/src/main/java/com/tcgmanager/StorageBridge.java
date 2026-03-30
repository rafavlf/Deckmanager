package com.tcgmanager;

import android.content.Context;
import android.webkit.JavascriptInterface;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * Ponte JS→Android que persiste dados no armazenamento interno do app.
 * Sobrevive a atualizações de APK. Só é apagado ao desinstalar.
 */
public class StorageBridge {

    private final Context context;

    public StorageBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void save(String key, String value) {
        try {
            File file = new File(context.getFilesDir(), sanitize(key) + ".dat");
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(value.getBytes(StandardCharsets.UTF_8));
            fos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @JavascriptInterface
    public String load(String key) {
        try {
            File file = new File(context.getFilesDir(), sanitize(key) + ".dat");
            if (!file.exists()) return null;
            FileInputStream fis = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            fis.close();
            return new String(data, StandardCharsets.UTF_8);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @JavascriptInterface
    public void remove(String key) {
        try {
            File file = new File(context.getFilesDir(), sanitize(key) + ".dat");
            if (file.exists()) file.delete();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Prevent path traversal
    private String sanitize(String key) {
        return key.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
