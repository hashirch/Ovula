package com.ovula.app.ui.main

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.ovula.app.databinding.FragmentProfileBinding
import com.ovula.app.ui.auth.AuthActivity
import com.ovula.app.utils.TokenManager
import com.ovula.app.ui.viewmodel.DashboardViewModel

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private val viewModel: DashboardViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupObservers()
        setupClickListeners()
        viewModel.fetchDashboardData()
    }

    private fun setupObservers() {
        viewModel.stats.observe(viewLifecycleOwner) { stats ->
            binding.tvTotalLogs.text = stats.totalLogs.toString()
            binding.tvAvgMood.text = stats.avgMood?.let { String.format("%.1f", it) } ?: "N/A"
            binding.tvAvgSleep.text = stats.avgSleep?.let { String.format("%.1fh", it) } ?: "N/A"
            binding.tvPeriodDays.text = stats.periodDays.toString()
        }
    }

    private fun setupClickListeners() {
        binding.btnLogout.setOnClickListener {
            logout()
        }
    }

    private fun logout() {
        TokenManager(requireContext()).clearToken()
        val intent = Intent(requireContext(), AuthActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        requireActivity().finish()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
