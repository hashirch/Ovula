package com.ovula.app.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.ovula.app.databinding.FragmentLogsHistoryBinding
import com.ovula.app.ui.adapter.LogsAdapter
import com.ovula.app.ui.viewmodel.LogsViewModel

class LogsHistoryFragment : Fragment() {

    private var _binding: FragmentLogsHistoryBinding? = null
    private val binding get() = _binding!!
    private val viewModel: LogsViewModel by viewModels()
    private lateinit var logsAdapter: LogsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLogsHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupObservers()
        viewModel.fetchLogs()
    }

    private fun setupRecyclerView() {
        logsAdapter = LogsAdapter { logId ->
            viewModel.deleteLog(logId)
        }
        binding.recyclerLogs.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = logsAdapter
        }
    }

    private fun setupObservers() {
        viewModel.logs.observe(viewLifecycleOwner) { logs ->
            logsAdapter.submitList(logs.reversed())
            binding.layoutEmptyState.visibility = if (logs.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
