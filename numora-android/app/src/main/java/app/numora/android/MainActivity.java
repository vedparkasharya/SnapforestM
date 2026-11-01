package app.numora.android;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import android.content.Intent;
import android.net.Uri;
import android.webkit.CookieManager;
import android.content.Context;
import android.os.Build;
import android.provider.Settings;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.view.Gravity;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
  private WebView web;
  private LinearLayout root, errorPanel;
  private TextView errorText;
  private static final String HOME = "https://numora-math-practice.vercel.app/";
  private static final String RELEASES_API = "https://api.github.com/repos/vedparkasharya/SnapforestM/releases/latest";
  private static final String RELEASES_PAGE = "https://github.com/vedparkasharya/SnapforestM/releases/latest";
  private final ExecutorService executor = Executors.newSingleThreadExecutor();
  private final Handler handler = new Handler(Looper.getMainLooper());
  private boolean updatePromptShown = false;

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().setStatusBarColor(Color.rgb(244,247,244));
    getWindow().setNavigationBarColor(Color.rgb(244,247,244));
    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);

    root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.setBackgroundColor(Color.rgb(244,247,244));
    web = new WebView(this);
    web.setBackgroundColor(Color.rgb(244,247,244));
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setLoadsImagesAutomatically(true);
    s.setJavaScriptCanOpenWindowsAutomatically(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setSupportMultipleWindows(false);
    s.setCacheMode(WebSettings.LOAD_DEFAULT);
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient(){
      private boolean trusted(Uri uri) {
        String host = uri.getHost();
        return "numora-math-practice.vercel.app".equalsIgnoreCase(host)
          || (host != null && host.endsWith(".vercel.app") && host.startsWith("numora-math-practice"));
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri=request.getUrl();
        if ("https".equalsIgnoreCase(uri.getScheme()) && trusted(uri)) return false;
        if ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme())) {
          startActivity(new Intent(Intent.ACTION_VIEW,uri)); return true;
        }
        return true;
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Uri uri=Uri.parse(url);
        if ("https".equalsIgnoreCase(uri.getScheme()) && trusted(uri)) return false;
        if ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme())) {
          startActivity(new Intent(Intent.ACTION_VIEW,uri)); return true;
        }
        return true;
      }
      @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        if (request.isForMainFrame()) showConnectionError();
      }
      @Override public void onPageFinished(WebView view, String url) {
        errorPanel.setVisibility(View.GONE);
        web.setVisibility(View.VISIBLE);
      }
    });

    errorPanel = new LinearLayout(this);
    errorPanel.setOrientation(LinearLayout.VERTICAL);
    errorPanel.setGravity(Gravity.CENTER);
    errorPanel.setPadding(32,32,32,32);
    errorPanel.setVisibility(View.GONE);
    TextView title = new TextView(this);
    title.setText("You're offline");
    title.setTextSize(24);
    title.setTypeface(null, Typeface.BOLD);
    title.setTextColor(Color.rgb(23,37,30));
    title.setGravity(Gravity.CENTER);
    errorText = new TextView(this);
    errorText.setText("Numora couldn't load. Check your internet connection and try again.");
    errorText.setTextSize(15);
    errorText.setTextColor(Color.rgb(100,115,105));
    errorText.setGravity(Gravity.CENTER);
    errorText.setPadding(0,12,0,22);
    Button retry = new Button(this);
    retry.setText("Try again");
    retry.setOnClickListener(v -> loadHome());
    Button update = new Button(this);
    update.setText("Check app update");
    update.setOnClickListener(v -> checkForUpdate(true));
    errorPanel.addView(title);
    errorPanel.addView(errorText);
    errorPanel.addView(retry);
    errorPanel.addView(update);

    root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
    root.addView(errorPanel,new LinearLayout.LayoutParams(-1,-1));
    setContentView(root);
    if(state==null) loadHome(); else {
      if(web.restoreState(state)==null) loadHome();
    }
    checkForUpdate(false);
  }

  private void loadHome() {
    errorPanel.setVisibility(View.GONE);
    web.setVisibility(View.VISIBLE);
    web.loadUrl(HOME);
  }
  private void showConnectionError() {
    web.setVisibility(View.GONE);
    errorPanel.setVisibility(View.VISIBLE);
  }
  private void checkForUpdate(boolean manual) {
    executor.execute(() -> {
      HttpURLConnection c=null;
      try {
        c=(HttpURLConnection)new URL(RELEASES_API).openConnection();
        c.setConnectTimeout(7000); c.setReadTimeout(7000);
        c.setRequestProperty("Accept","application/vnd.github+json");
        c.setRequestProperty("User-Agent","Numora-Android");
        BufferedReader br=new BufferedReader(new InputStreamReader(c.getInputStream()));
        StringBuilder body=new StringBuilder(); String line;
        while((line=br.readLine())!=null) body.append(line);
        br.close();
        JSONObject release=new JSONObject(body.toString());
        String tag=release.optString("tag_name","");
        String notes=release.optString("body","");
        int latest=extractVersionCode(notes);
        String download=RELEASES_PAGE;
        if(release.has("assets") && release.getJSONArray("assets").length()>0) {
          download=release.getJSONArray("assets").getJSONObject(0).optString("browser_download_url",RELEASES_PAGE);
        }
        final int current=getPackageManager().getPackageInfo(getPackageName(),0).versionCode;
        final String url=download;
        final boolean available=latest>current;
        handler.post(() -> {
          if(available && !updatePromptShown) {
            updatePromptShown=true;
            new AlertDialog.Builder(this).setTitle("Numora update available")
              .setMessage("A newer version "+tag+" is ready. Update now for the latest features and fixes.")
              .setPositiveButton("Download update",(d,w)->openRelease(url))
              .setNegativeButton("Later",null).show();
          } else if(manual) {
            new AlertDialog.Builder(this).setTitle("Numora")
              .setMessage(available ? "A new update is available." : "You're using the latest app version.")
              .setPositiveButton(available?"Download":"OK",(d,w)->{if(available)openRelease(url);}).show();
          }
        });
      } catch(Exception e) {
        if(manual) handler.post(() -> new AlertDialog.Builder(this).setTitle("Update check failed")
          .setMessage("Please check your internet connection and try again.")
          .setPositiveButton("OK",null).show());
      } finally { if(c!=null)c.disconnect(); }
    });
  }
  private int extractVersionCode(String notes) {
    try {
      java.util.regex.Matcher m=java.util.regex.Pattern.compile("versionCode\\s*=\\s*(\\d+)").matcher(notes);
      return m.find()?Integer.parseInt(m.group(1)):0;
    } catch(Exception e){return 0;}
  }
  private void openRelease(String url) {
    try { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url))); }
    catch(Exception e) { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(RELEASES_PAGE))); }
  }
  @Override protected void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);if(web!=null)web.saveState(out);}
  @Override public void onBackPressed(){if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();}
  @Override protected void onDestroy(){if(web!=null)web.destroy();executor.shutdownNow();super.onDestroy();}
}
