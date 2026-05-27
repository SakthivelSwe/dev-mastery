package com.example.devmastery

import android.app.Application
import com.example.devmastery.di.AppContainer

class DevMasteryApp : Application() {
    lateinit var container: AppContainer
    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
