package com.ovula.app.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.ovula.app.R
import com.ovula.app.databinding.FragmentDashboardBinding
import com.ovula.app.ui.viewmodel.DashboardViewModel
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.min

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private val viewModel: DashboardViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupObservers()
        setupClickListeners()
        viewModel.fetchDashboardData()
    }

    private fun setupObservers() {
        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.stats.observe(viewLifecycleOwner) { stats ->
            binding.tvTotalLogs.text = stats.totalLogs.toString()
            binding.tvAvgMood.text = stats.avgMood?.let { String.format("%.1f", it) } ?: "N/A"
            binding.tvAvgSleep.text = stats.avgSleep?.let { String.format("%.1fh", it) } ?: "N/A"
            binding.tvPeriodDays.text = stats.periodDays.toString()
            
            binding.cardStats.visibility = if (stats.totalLogs > 0) View.VISIBLE else View.GONE
        }

        viewModel.logs.observe(viewLifecycleOwner) { logs ->
            val cycleInfo = calculateCycleInfo(logs)
            
            if (cycleInfo.hasData) {
                binding.layoutCycleData.visibility = View.VISIBLE
                binding.layoutNoData.visibility = View.GONE
                binding.tvCycleDay.text = cycleInfo.currentDay.toString()
                binding.tvCycleStatus.text = if (cycleInfo.daysSincePeriod == 0) {
                    "Period Day"
                } else {
                    "Day ${cycleInfo.daysSincePeriod + 1} of Cycle"
                }
            } else {
                binding.layoutCycleData.visibility = View.GONE
                binding.layoutNoData.visibility = View.VISIBLE
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnAddFirstLog.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_addLog)
        }
        
        binding.actionMood.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_addLog)
        }
        binding.actionEnergy.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_addLog)
        }
        binding.actionFlow.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_addLog)
        }
        binding.actionSymptoms.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_addLog)
        }
        
        binding.cardChat.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_chat)
        }
        
        binding.cardInsights.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_insights)
        }
        
        binding.cardDiet.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_diet)
        }
        
        binding.cardPcos.setOnClickListener {
            findNavController().navigate(R.id.action_dashboard_to_insights)
        }
    }

    private fun calculateCycleInfo(logs: List<com.ovula.app.data.model.LogResponse>): CycleInfo {
        val periodLogs = logs.filter { it.periodStatus == "period" }
        
        if (periodLogs.isEmpty()) {
            return CycleInfo(0, 0, false)
        }

        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val sortedLogs = periodLogs.sortedByDescending { 
            try {
                dateFormat.parse(it.date)?.time ?: 0
            } catch (e: Exception) {
                0
            }
        }
        
        val lastPeriodDate = try {
            dateFormat.parse(sortedLogs[0].date)
        } catch (e: Exception) {
            null
        }
        
        if (lastPeriodDate == null) {
            return CycleInfo(0, 0, false)
        }
        
        val today = Calendar.getInstance().time
        val daysSincePeriod = ((today.time - lastPeriodDate.time) / (1000 * 60 * 60 * 24)).toInt()
        val currentDay = min(daysSincePeriod + 1, 35)
        
        return CycleInfo(currentDay, daysSincePeriod, true)
    }

    data class CycleInfo(
        val currentDay: Int,
        val daysSincePeriod: Int,
        val hasData: Boolean
    )

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
