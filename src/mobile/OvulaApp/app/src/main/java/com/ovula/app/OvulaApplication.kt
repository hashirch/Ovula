package com.ovula.app

import android.app.Application
import com.ovula.app.data.api.RetrofitClient

class OvulaApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        RetrofitClient.initialize(this)
    }
}
