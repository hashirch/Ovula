package com.ovula.app.ui.adapter

import androidx.fragment.app.Fragment
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.ovula.app.ui.main.DietTabFragment

class DietPagerAdapter(fragment: Fragment) : FragmentStateAdapter(fragment) {

    override fun getItemCount(): Int = 2

    override fun createFragment(position: Int): Fragment {
        return DietTabFragment.newInstance(if (position == 0) "western" else "desi")
    }
}
