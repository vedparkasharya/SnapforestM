package app.numora.android;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import android.content.Intent;
import android.net.Uri;
import android.webkit.CookieManager;

public class MainActivity extends Activity {
  private WebView web;
  private static final String HOME = "https://numora-math-practice.vercel.app/";
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().setStatusBarColor(Color.rgb(244,247,244));
    getWindow().setNavigationBarColor(Color.rgb(244,247,244));
    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
    web = new WebView(this);
    web.setBackgroundColor(Color.rgb(244,247,244));
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setLoadsImagesAutomatically(true);
    s.setJavaScriptCanOpenWindowsAutomatically(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri=request.getUrl();
        if ("numora-math-practice.vercel.app".equals(uri.getHost())) return false;
        startActivity(new Intent(Intent.ACTION_VIEW,uri)); return true;
      }
    });
    setContentView(web);
    if(state==null) web.loadUrl(HOME); else web.restoreState(state);
  }
  @Override protected void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);web.saveState(out);}
  @Override public void onBackPressed(){if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();}
  @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}
