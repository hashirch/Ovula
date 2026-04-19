package com.ovula.app.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.ovula.app.databinding.FragmentInsightsBinding
import com.ovula.app.ui.viewmodel.InsightsViewModel

class InsightsFragment : Fragment() {

    private var _binding: FragmentInsightsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: InsightsViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentInsightsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupObservers()
        viewModel.fetchInsights()
    }

    private fun setupObservers() {
        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.insights.observe(viewLifecycleOwner) { insights ->
            binding.layoutContent.visibility = View.VISIBLE
            binding.tvTotalLogs.text = insights.totalLogs.toString()
            binding.tvAvgMood.text = String.format("%.1f", insights.avgMood)
            binding.tvAvgSleep.text = String.format("%.1fh", insights.avgSleep)
            binding.tvAvgPain.text = String.format("%.1f", insights.avgPain)
            binding.tvAvgAcne.text = String.format("%.1f", insights.avgAcne)
            binding.tvPeriodFreq.text = "${insights.periodFrequency} days"
            
            // Display recommendations
            val recommendationsText = insights.recommendations.joinToString("\n\n") { "• $it" }
            binding.tvRecommendations.text = recommendationsText
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
