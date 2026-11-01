package app.numora.android;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.graphics.Color;
import android.graphics.Typeface;
import android.content.Intent;
import android.net.Uri;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.webkit.*;
import android.widget.*;
import android.graphics.drawable.GradientDrawable;

public class MainActivity extends Activity {
  private static final String HOME = "https://numora-math-practice.vercel.app/";
  private static final String RELEASES = "https://github.com/vedparkasharya/SnapforestM/releases";
  private WebView web;
  private LinearLayout root, errorPanel;
  private ProgressBar progress;
  private TextView status;
  private boolean firstLoad = true;

  private GradientDrawable rounded(int color, int radius) {
    GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(radius); return d;
  }
  private TextView text(String value, int size, int color, boolean bold) {
    TextView t = new TextView(this); t.setText(value); t.setTextSize(size); t.setTextColor(color);
    if (bold) t.setTypeface(Typeface.DEFAULT, Typeface.BOLD); t.setGravity(Gravity.CENTER); return t;
  }
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().setStatusBarColor(Color.rgb(247,248,252));
    getWindow().setNavigationBarColor(Color.rgb(247,248,252));
    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);

    root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.rgb(247,248,252));
    LinearLayout bar = new LinearLayout(this); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setPadding(18,10,14,10);
    TextView brand=text("Σ  Numora",22,Color.rgb(65,75,190),true); bar.addView(brand,new LinearLayout.LayoutParams(0,52,1));
    TextView update=text("↻  Update",14,Color.WHITE,true); update.setPadding(15,12,15,12); update.setBackground(rounded(Color.rgb(91,75,220),40));
    update.setOnClickListener(v->openReleases()); bar.addView(update);
    root.addView(bar,new LinearLayout.LayoutParams(-1,64));

    progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
    progress.setMax(100); progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(105,82,230)));
    root.addView(progress,new LinearLayout.LayoutParams(-1,3));

    web=new WebView(this); web.setBackgroundColor(Color.rgb(247,248,252));
    WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
    s.setLoadsImagesAutomatically(true); s.setJavaScriptCanOpenWindowsAutomatically(true);
    s.setMediaPlaybackRequiresUserGesture(false); s.setCacheMode(WebSettings.LOAD_DEFAULT);
    CookieManager.getInstance().setAcceptCookie(true); CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
    web.setWebChromeClient(new WebChromeClient(){
      @Override public void onProgressChanged(WebView view,int value){progress.setProgress(value);progress.setVisibility(value>=100?View.GONE:View.VISIBLE);}
    });
    web.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request){
        Uri uri=request.getUrl(); String host=uri.getHost();
        if(host!=null&&(host.equals("numora-math-practice.vercel.app")||host.endsWith(".vercel.app")))return false;
        try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){} return true;
      }
      @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap icon){errorPanel.setVisibility(View.GONE);progress.setVisibility(View.VISIBLE);}
      @Override public void onPageFinished(WebView view,String url){progress.setVisibility(View.GONE);errorPanel.setVisibility(View.GONE);firstLoad=false;}
      @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
        if(request.isForMainFrame())showError();
      }
      @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response){
        if(request.isForMainFrame()&&response.getStatusCode()>=500)showError();
      }
    });
    root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
    errorPanel=new LinearLayout(this); errorPanel.setOrientation(LinearLayout.VERTICAL); errorPanel.setGravity(Gravity.CENTER); errorPanel.setPadding(28,24,28,32);
    TextView icon=text("☁",48,Color.rgb(105,82,230),true); errorPanel.addView(icon);
    status=text("Unable to load Numora",20,Color.rgb(35,43,60),true); errorPanel.addView(status);
    TextView hint=text("Check your internet connection and try again.",14,Color.GRAY,false); hint.setPadding(8,8,8,18); errorPanel.addView(hint);
    Button retry=new Button(this); retry.setText("Retry"); retry.setOnClickListener(v->{errorPanel.setVisibility(View.GONE);web.loadUrl(HOME);}); errorPanel.addView(retry);
    errorPanel.setVisibility(View.GONE); root.addView(errorPanel,new LinearLayout.LayoutParams(-1,0,1));
    setContentView(root);
    if(state==null) web.loadUrl(HOME); else { if(web.restoreState(state)==null)web.loadUrl(HOME); }
  }
  private void showError(){progress.setVisibility(View.GONE);errorPanel.setVisibility(View.VISIBLE);}
  private void openReleases(){try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(RELEASES)));}catch(Exception e){Toast.makeText(this,"Could not open update page",Toast.LENGTH_SHORT).show();}}
  @Override protected void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);if(web!=null)web.saveState(out);}
  @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
  @Override protected void onDestroy(){if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}